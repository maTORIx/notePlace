class Note < ApplicationRecord
  include Elasticsearch::Model
  include Elasticsearch::Model::Callbacks
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
    note = self

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
    }).merge("tags" => self.getTags)
  end

  def getTags
    self.description.scan(/(?:\s|^)(#[^#\s]+)/).map {|tags| tags[0]}
  end

  settings do
    mappings dynamic: "false" do
      indexes :title, type: "string", analyzer: "kuromoji"
      indexes :description, type: "text", analyzer: "kuromoji"
      indexes :tags, type: "text", analyzer: "kuromoji"
      indexes :user do
        indexes :user_info do
          indexes :name, analyzer: 'keyword', index: 'not_analyzed'
        end
      end
    end
  end

  def self.search(query)
    __elasticsearch__.search({
      query: {
        multi_match: {
          fields: %w(title description user.user_info.name tags^100),
          fuzziness: "AUTO",
          type: "most_fields",
          query: query
        },
      }
    })
  end

  def self.searchByTag(query)
    __elasticsearch__.search({
      query: {
        multi_match: {
          fields: %w(tags),
          query: query
        }
      }
    })
  end
end
