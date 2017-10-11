class UserInfosController < ApplicationController
  # def index
    
  # end

  def show
    @user_info = UserInfo.find(params[:id])
  end

  def edit
    @user_info = UserInfo.find_or_create_by(user_id: current_user.id)
  end

  def update
    @user_info = current_user.user_info
    user_info_params = params.require(:user_info).permit(:hometown, :birthday, :description, :name)
    @user_info.update(user_info_params)
    @user_info.icon = params[:file]
    @user_info.save!
    redirect_to @user_info
  end
end
