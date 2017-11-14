class Organization < ApplicationRecord
  has_many :members
  has_many :member_users, through: :members, source: :user
  has_many :member_requests
  has_many :member_request_users, through: :member_requests, source: :user
  has_many :subscribers
  has_many :subscriber_users, through: :subscribers, source: :user
  has_many :scopes
  has_many :notes, through: :scopes
  mount_uploader :icon, OrgIconUploader
  mount_uploader :image, OrgImageUploader
  include Elasticsearch::Model
  include Elasticsearch::Model::Callbacks

  def to_param
    name
  end

  def isMember(user)
    self.member_users.include?(user)
  end

  def isSubscriber(user)
    self.subscriber_users.include?(user)
  end
  
  def isMemberRequestedUser(user)
    self.member_request_users.include?(user)
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
