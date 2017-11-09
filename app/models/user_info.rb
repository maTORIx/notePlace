class UserInfo < ApplicationRecord
  include Elasticsearch::Model
  include Elasticsearch::Model::Callbacks
  belongs_to :user
  mount_uploader :icon, UserIconUploader

  settings do
    mappings dynamic: "false" do
      indexes :name, type: "string", analyzer: "kuromoji"
      indexes :description, type: "text", analyzer: "kuromoji"
      indexes :hometown, type: "string", analyzer: "kuromoji"
    end
  end

  def self.search(query)
    __elasticsearch__.search({
      query: {
        multi_match: {
          fields: %w(name description hometown),
          fuzziness: "AUTO",
          query: query
        }
      }
    })
  end
end
