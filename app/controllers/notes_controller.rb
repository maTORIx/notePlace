class NotesController < ApplicationController
  def show
    if current_user  && [nil, "html"].include?(params[:format])
      gon.user_id = current_user.id
      gon.note_id = params[:id]
    end

    @note = Note.find(params[:id])
    note_json = JSON.generate({
                id: @note.id,
                title: @note.title,
                user_id: @note.user_id,
                secret: @note.secret,
                favorite: current_user.isFavorite(@note),
                subscriber_only: @note.subscriber_only,
                description: @note.description,
                filename: @note.note.file.filename
              })
    respond_to do |format|
      format.html
      format.json { render json: note_json }
    end
  end

  def new
    @note = Note.new
    if current_user  && [nil, "html"].include?(params[:format])
      gon.user_id = current_user.id
    end
  end

  def create
    note_params = params.permit(:title, :description, :note, :secret, :subscriber_only)
    @note = current_user.notes.create(note_params)
    render json: JSON.generate({id: @note.id, title: @note.title, description: @note.description})
  end
  
  def edit
    @note = Note.find(params[:id])
    gon.user_id = current_user.id
    if(@note.user_id == current_user.id)
      gon.note_id = @note.id
    else
      render nothing: true, status: :forbidden
    end
  end
  
  def update
    note_params = params.permit(:title, :description, :note, :secret, :subscriber_only)
    @note = Note.find(params[:id])
    if(@note.user_id == current_user.id)
      @note.lock!
      @note.update!(note_params)
      render json: JSON.generate({id: @note.id, title: @note.title, description: @note.description})
    else
      render nothing: true, status: :forbidden
    end
  end
  
  def destory
    @note = Note.find(params[:id])
    @note.destory
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
    @json = "[]"
    if params[:type] == "organizations"
      data = @note.organizations.map do |org|
        {id: org.id, name: org.name, description: org.description, icon: org.icon.url}
      end
      @json = JSON.generate(data)
    elsif params[:type] == "scopes"
      data = @note.scopes.map do |scope|
        {id: scope.id, note_id: scope.note_id, organization_id: scope.organization_id}
      end
      @json = JSON.generate(data)
    end

    respond_to do |format|
      format.html { render json: @json}
      format.json { render json: @json}
    end
  end
end
