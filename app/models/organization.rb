class Organization < ApplicationRecord
  has_many :members
  has_many :users, through: :members
  mount_uploader :icon, OrgIconUploader
  mount_uploader :image, OrgImageUploader
end
