class Note < ApplicationRecord
  include Elasticsearch::Model
  include Elasticsearch::Model::Callbacks
  belongs_to :user
  mount_uploader :note, NoteFileUploader
  has_many :scopes
  has_many :organizations, through: :scopes

  def isAllowUser(user)
    if self.secret
      false
    elsif self.subscriber_only
      self.organizations.each do |org|
        if org.isSubscriber(user) == true
          true
        end
      end
      false
    else
      true
    end
  end

  settings do
    mappings dynamic: "false" do
      indexes :title, type: "string", analyzer: "kuromoji"
      indexes :description, type: "text", analyzer: "kuromoji"
    end
  end

  def self.search(query)
    __elasticsearch__.search({
      query: {
        multi_match: {
          fields: %w(title description),
          fuzziness: "AUTO",
          query: query
        }
      }
    })
  end
end
