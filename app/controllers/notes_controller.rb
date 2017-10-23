class NotesController < ApplicationController
  def show
    @note = Note.find(params[:id])
    note_json = {
                  id: @note.id,
                  title: @note.title,
                  user_id: @note.user_id
                }.to_json
    if current_user  && [nil, "html"].include?(params[:format])
      gon.user_id = current_user.id
      gon.note_id = @note.id
    end
    respond_to do |format|
      format.html
      format.json { render json: note_json }
    end
  end

  def new
    @note = Note.new
  end

  def create
    note_params = params.require(:note).permit(:note, :title, :description)
    @note = current_user.notes.create(note_params)
    redirect_to @note
  end
  
  def edit
     @note = Note.find(params[:id])
  end
  
  def update
    note_params = params.require(:note).permit(:note, :title, :description)
    @note = Note.find(params[:id])
    @note.update(note_params)
    redirect_to @note
  end
  
  def destory
    @note = Note.find(params[:id])
    @note.destory
    redirect_to root
  end

  def file
    @note = Note.find(params[:id])
    full_path = @note.note.current_path
    image = File.binread(full_path)
    send_data image, :disposition => 'inline'
  end
end
