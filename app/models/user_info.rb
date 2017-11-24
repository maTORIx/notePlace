class UserInfo < ApplicationRecord
  include Elasticsearch::Model
  include Elasticsearch::Model::Callbacks
  belongs_to :user
  mount_uploader :icon, UserIconUploader

  def toMap
    {id: self.id, name: self.name, description: self.description, icon: self.icon.url}
  end

  def as_indexed_json(option={})
    self.as_json().merge("tags" => self.tags)
  end
  
  def tags
    self.description.scan(/(?:\s|^)#([^#\s]+)/).map {|data| data[0]}
  end

  settings do
    mappings dynamic: "false" do
      indexes :name, type: "string", analyzer: "kuromoji"
      indexes :description, type: "text", analyzer: "kuromoji"
      indexes :hometown, type: "string", analyzer: "kuromoji"
      indexes :tags, type: "string", index: "not_analyzed"
    end
  end

  def self.search(query)
    tags = query.scan(/(?:\s|^)#([^#\s]+)/).map {|data| data[0]}
    search_definition = Elasticsearch::DSL::Search.search do
      query do
        bool do
          must do
            multi_match do
              fields %w(title description tags^10)
              fuzziness "AUTO"
              type "most_fields"
              query query
            end
          end
          filter do
            if tags.length != 0
              terms tags: tags
            else
              match_all
            end
          end
        end
      end
    end
    
    __elasticsearch__.search(search_definition)
  end
end
