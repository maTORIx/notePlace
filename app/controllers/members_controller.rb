class MembersController < ApplicationController
  def index
    @members = Members.all
  end

  def show
    @members = Members.find(params[:id])
  end

  def create
  end

  def destroy
  end
end
