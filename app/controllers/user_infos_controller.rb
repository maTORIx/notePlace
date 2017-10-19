class UserInfosController < ApplicationController
  def index
    @user_infos = UserInfo.all
  end

  def show
    @user_info = UserInfo.find_by(user_id: params[:id])
    if params[:format] == "html" || !params[:format]
      gon.user_id = current_user.id
    end

    user_info_json = JSON.generate({
                        id: @user_info.user_id,
                        name: @user_info.name,
                        icon: @user_info.icon.url,
                        hometown: @user_info.hometown,
                      })
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

  def search
    @user = User.find(params[:id])
    @json = "[]"
    if params[:type] == "notes"
      notes = @user.notes.map {|data| {id: data.id, title: data.title, user_id: data.user_id}}
      @json = JSON.generate(notes)
    elsif ["subscriber_organizations", "member_organizations", "member_request_organizations"].include? params[:type]
      data = @user.send(params[:type]).map {|data| {id: data.id, name: data.name, description: data.description, icon: data.icon.url}}
      @json = JSON.generate(data)
    end

    respond_to do |format|
      format.html { render json: @json}
      format.json { render json: @json}
    end
  end
end
