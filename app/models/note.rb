class Note < ApplicationRecord
  belongs_to :user
  mount_uploader :note, NoteFileUploader
  has_many :scopes
  has_many :organizations, through: :scopes
end
