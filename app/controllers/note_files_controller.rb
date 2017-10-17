class NoteFilesController < ApplicationController
  def show
    @note = Note.find(params[:id])
    full_path = @note.note.current_path
    image = File.binread(full_path)
    send_data image, :disposition => 'inline'
  end
end
