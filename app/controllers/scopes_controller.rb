class ScopesController < ApplicationController
  def index
    @scopes = Scope.all
  end

  def show
    @scope = Scope.find(params[:id])
  end

  def create
    scope_params = params.require(:scope).permit(:note_id)
    @note =  Note.find(scope_params[:note_id])
    if current_user.id != @note.user_id
      render :forbidden
    end
    @scope = @note.scope.create(scope_params)
    redirect_to @scope
  end

  def destroy
    @scope = Scope.find(params[:id])
    if current_user.id == @scope.note.user.id
    @scope.destroy
    redirect_to root
  end

  def search
    @scopes_json = "[]"
    if params[:from] == "note_id"
      scopes = Scope.where(user_id: params[:search_id])
      if scopes != nil
        @scopes_json = "[" + scopes.map {|data| data.as_json}.join(",") + "]"
      end
    elsif params[:from] == "org_id"
      scopes = Scope.where(organization_id: params[:search_id])
      if scopes != nil
        @scopes_json = "[" + scopes.map {|data| data.as_json}.join(",") + "]"
      end
    end
    respond_to do |format|
      format.json {render json: @scopes_json}
      format.json {render json: @scopes_json}
    end
  end
end
