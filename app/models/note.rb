class Note < ApplicationRecord
  include Elasticsearch::Model
  include Elasticsearch::Model::Callbacks
  include Elasticsearch::DSL
  belongs_to :user
  mount_uploader :note, NoteFileUploader
  has_many :scopes
  has_many :organizations, through: :scopes
  has_many :stars
  has_many :star_notes, through: :scopes, source: :users

  def toMap(user = nil)
    result = {
      id: self.id,
      title: self.title,
      user_id: self.user_id,
      secret: self.secret,
      star: {
        length: self.stars.length,
      },
      subscriber_only: self.subscriber_only,
      description: self.description,
      filename: self.note.file.filename
    }
    if user != nil
      result[:star][:stared] = user.isFavorite(self)
    end

    result
  end

  def isAllowUser(user)
    if self.secret
      if(user = self.user)
        return true
      else
        return false
      end
    elsif self.subscriber_only
      self.organizations.each do |org|
        if org.isSubscriber(user) == true
          return true
        end
      end
      return false
    else
      return true
    end
  end

  def as_indexed_json(option={})
    self.as_json({
      include: {
        user: {
          only: [],
          include: {
            user_info: {
              only: [:name]
            }
          }
        }
      }
    }).merge("tags" => self.tags)
  end

  def tags
    self.description.scan(/(?:\s|^)#([^#\s]+)/).map {|data| data[0]}
  end

  settings do
    mappings dynamic: "false" do
      indexes :user_id, type: "integer", index: "not_analyzed"
      indexes :title, type: "string", analyzer: "kuromoji"
      indexes :description, type: "text", analyzer: "kuromoji"
      indexes :tags, type: "string", index: "not_analyzed"
      indexes :user do
        indexes :user_info do
          indexes :name, analyzer: 'keyword', index: 'not_analyzed'
        end
      end
    end
  end

  def self.search(query)
    tags = query.scan(/(?:\s|^)#([^#\s]+)/).map {|data| data[0]}
    p tags
    p query
    search_definition = Elasticsearch::DSL::Search.search do
      query do
        bool do
          must do
            multi_match do
              fields %w(title description user.user_info.name tags^100)
              fuzziness "AUTO"
              type "most_fields"
              query query
            end
          end
          filter do
            if(tags.length == 0)
              match_all
            else
              terms tags: tags
            end
          end
        end
      end
    end
    __elasticsearch__.search(search_definition)
  end

  def self.searchWithUser(query, user)
    tags = query.scan(/(?:\s|^)#([^#\s]+)/).map {|data| data[0]}
    search_definition = Elasticsearch::DSL::Search.search do
      query do
        bool do
          must do
            multi_match do
              fields %w(title description user.user_info.name tags^100)
              fuzziness "AUTO"
              type "most_fields"
              query query
            end
          end
        
          filter do
            bool do
              must do
                term user_id: user.id
                if tags.length != 0
                  terms tags: tags
                end
              end
            end
          end
        end
      end
    end
    
    
    __elasticsearch__.search(search_definition)
  end
end
