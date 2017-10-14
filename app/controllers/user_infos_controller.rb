class UserInfosController < ApplicationController
  def index
    @user_infos = UserInfo.all
  end

  def show
    @user_info = UserInfo.find_by(user_id: params[:id])
    user_info_json = {
                        id: @user_info.user_id,
                        name: @user_info.name,
                        icon: @user_info.icon.url,
                        hometown: @user_info.hometown,
                      }.to_json
    respond_to do |format|
      format.html
      format.json { render json: user_info_json}
    end
  end

  def edit
    @user_info = UserInfo.find_or_create_by(user_id: current_user.id)
  end

  def update
    @user_info = current_user.user_info
    user_info_params = params.require(:user_info).permit(:hometown, :description, :name, :icon)
    @user_info.update(user_info_params)
    redirect_to @user_info
  end
end
