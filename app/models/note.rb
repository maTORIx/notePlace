class Note < ApplicationRecord
  belongs_to :user
  mount_uploader :note, NoteFileUploader
end
