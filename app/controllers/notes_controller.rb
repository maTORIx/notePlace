class NotesController < ApplicationController
  def show
    @note = Note.find(params[:id])
    note_json = {
                  id: @note.id,
                  title: @note.title,
                }.to_json
    respond_to do |format|
      format.html
      format.json { render json: note_json}
    end
  end

  def new
    @note = Note.new
  end

  def create
    note_params = params.require(:note).permit(:note, :title)
    @note = current_user.notes.create(note_params)
    redirect_to @note
  end
  
  def edit
     @note = Note.find(params[:id])
  end
  
  def update
    note_params = params.require(:note).permit(:note, :title)
    @note = Note.find(params[:id])
    @note.update(note_params)
    redirect_to @note
  end
  
  def destory
    @note = Note.find(params[:id])
    @note.destory
    redirect_to root
  end
end
