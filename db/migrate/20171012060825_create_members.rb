class CreateMembers < ActiveRecord::Migration[5.1]
  def change
    create_table :members do |t|
      t.integer :organization_id, null: false
      t.integer :user_id, null: false

      t.timestamps
    end
  end
end
