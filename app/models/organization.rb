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

  def toMap(user = nil)
    result = {
      id: self.id,
      name: self.name,
      description: self.description,
      icon: self.icon.url,
      image: self.image.url,
      subscribers: self.subscriber_users.map{|user| user.toMap},
      members: self.member_users.map{|user| user.toMap},
      member_requests: self.member_request_users.map{|user| user.toMap},
    }
    result
  end

  def toSmallMap()
    result = {
      id: self.id,
      name: self.name,
      description: self.description,
      icon: self.icon.url,
      image: self.image.url,
    }
    result
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
              fields %w(name description tags^100)
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
