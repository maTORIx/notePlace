class CreateUserInfos < ActiveRecord::Migration[5.1]
  def change
    create_table :user_infos do |t|
      t.string :name
      t.integer :user_id, null: false
      t.text :description, null: true
      t.string :hometown, null: true
      t.date :birthday, null: true

      t.timestamps
    end
  end
end
