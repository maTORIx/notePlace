class UserInfo < ApplicationRecord
  belongs_to :user
  mount_uploader :user_icon, UserIconUploader
end
