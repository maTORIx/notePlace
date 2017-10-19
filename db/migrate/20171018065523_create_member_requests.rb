class CreateMemberRequests < ActiveRecord::Migration[5.1]
  def change
    create_table :member_requests do |t|
      t.integer :organization_id, null: false
      t.integer :user_id, null: false

      t.timestamps
      t.index ["organization_id", "user_id"]
    end
  end
end
