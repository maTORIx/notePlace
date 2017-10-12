class CreateOrganizations < ActiveRecord::Migration[5.1]
  def change
    create_table :organizations do |t|
      t.string :name, null: false
      t.string :icon
      t.string :image
      t.text :description

      t.index ["name"], unique: true
    end
  end
end
