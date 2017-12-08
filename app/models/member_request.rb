class MemberRequest < ApplicationRecord
  belongs_to :user
  belongs_to :organization

  def toMap
    {id: self.id, user_id: self.user_id, organization_id: self.organization_id}
  end
end
