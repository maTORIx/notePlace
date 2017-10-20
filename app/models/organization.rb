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
end
