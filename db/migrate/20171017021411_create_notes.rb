class CreateNotes < ActiveRecord::Migration[5.1]
  def change
    create_table :notes do |t|
      t.string :file_name, null: false
      t.binary :file, null: false

      t.timestamps
    end
  end
end
