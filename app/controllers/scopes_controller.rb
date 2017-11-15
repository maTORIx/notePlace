class ScopesController < ApplicationController
  def create
    p "-----------------"
    p params
    scope_params = params.require(:scope).permit(:note_id, :organization_id)
    @note =  Note.find(scope_params[:note_id])
    @org = Organization.find_by(id: scope_params[:organization_id])
    if current_user.id != @note.user_id
      render :forbidden
    elsif @org == nil
      render :forbidden
    end
    @scope = Scope.create(scope_params)
    redirect_to @scope
  end

  def destroy
    @scope = Scope.find(params[:id])
    if current_user.id == @scope.note.user.id
    @scope.destroy
    end
  end
end
