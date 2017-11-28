class Scope < ApplicationRecord
  belongs_to :note
  belongs_to :organization

  def toMap
    {id: self.id, note_id: self.note_id, organization_id: self.organization_id}
  end
end
