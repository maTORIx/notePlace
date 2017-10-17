class ScopesController < ApplicationController
  def index
    @scopes = Scope.all
  end

  def show
    @scope = Scope.find(params[:id])
  end

  def create
    scope_params = params[:scope].permit(:note_id)
    @scope = current_user.scope.create(scope_params)
    redirect_to @scope
  end

  def destroy
    @scope = Scope.find(params[:id])
    @scope.destroy
    redirect_to root
  end
end
