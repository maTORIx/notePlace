class NotesController < ApplicationController
  def show
    if current_user  && [nil, "html"].include?(params[:format])
      gon.user_id = current_user.id
      gon.note_id = params[:id]
    end

    @note = Note.find(params[:id])
    note_json = JSON.generate(@note.toMap(current_user))
    respond_to do |format|
      format.html
      format.json { render json: note_json }
    end
  end

  def new
    @note = Note.new
    if current_user  && [nil, "html"].include?(params[:format])
      gon.user_id = current_user.id
      @allow_edit = @note.user_id == current_user.id
    end
  end

  def create
    note_params = params.permit(:title, :description, :note, :scope_setting)
    @note = current_user.notes.create(note_params)
    render json: JSON.generate({id: @note.id, title: @note.title, description: @note.description})
  end
  
  def edit
    @note = Note.find(params[:id])
    gon.user_id = current_user.id
    gon.note_id = @note.id
    if(@note.user_id != current_user.id)
      render status: :forbidden
    end
  end
  
  def update
    note_params = params.permit(:title, :description, :note, :scope_setting)
    @note = Note.find(params[:id])
    if(@note.user_id == current_user.id)
      @note.lock!
      @note.update!(note_params)
      render json: JSON.generate({id: @note.id, title: @note.title, description: @note.description})
    else
      render plain: "403 Forbidden", status: :forbidden
    end
  end
  
  def destory
    @note = Note.find(params[:id])
    if(@note.user_id == current_user.id)
      @note.destory
    end
    redirect_to "/"
  end

  def file
    @note = Note.find(params[:id])
    if !@note.isAllowUser(current_user)
      render :plain => "Forbidden", status: 403
    else
      full_path = @note.note.current_path
      send_file full_path, file_name: @note.note.file.filename
    end
  end

  def info
    @note = Note.find(params[:id])
    data = []
    if params[:type] == "organizations"
      data = @note.organizations.map do |org|
        org.toSmallMap
      end
    elsif params[:type] == "scopes"
      data = @note.scopes.map do |scope|
        scope.toMap
      end
    end

    render json: JSON.generate(data)
  end
end
