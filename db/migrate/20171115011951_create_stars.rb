class CreateStars < ActiveRecord::Migration[5.1]
  def change
    create_table :stars do |t|
      t.integer :user_id, null: false
      t.integer :note_id, null: false

      t.timestamps

      t.index ["user_id", "note_id"], unique: true
    end
  end
end
