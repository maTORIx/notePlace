class UserInfosController < ApplicationController
  def index
    @user_infos = UserInfo.all
  end

  def show
    @user_info = UserInfo.find_by(user_id: params[:id])
    if params[:format] == "html" || !params[:format]
      gon.user_id = current_user.id
      gon.show_user_id = params[:id]
    end

    user_info_json = JSON.generate({
                        id: @user_info.user_id,
                        name: @user_info.name,
                        icon: @user_info.icon.url,
                        description: @user_info.description,
                        hometown: @user_info.hometown,
                      })
    respond_to do |format|
      format.html
      format.json { render json: user_info_json}
    end
  end

  def edit
    gon.user_id = current_user.id
    @user_info = UserInfo.find_or_create_by(user_id: current_user.id)
  end

  def update
    @user_info = current_user.user_info
    user_info_params = params.require(:user_info).permit(:hometown, :description, :name, :icon)
    @user_info.update!(user_info_params)
    redirect_to @user_info
  end

  def info
    @user = User.find(params[:id])
    results = []
    if ["notes", "star_notes"].include?(params[:type])
      results = @user.send(params[:type]).map {|data| data.toMap(current_user)}
    elsif params[:type] == "timeline"
      orgs = @user.subscriber_organizations
      results = []
      orgs.each do |org|
        org.notes.each do |data|
          results.push(data.toMap(current_user))
        end
      end
    elsif ["subscriber_organizations", "member_organizations", "member_request_organizations"].include? params[:type]
      results = @user.send(params[:type]).map {|data| data.toMap}
    elsif ["members", "subscribers", "member_requests"].include?(params[:type]) && params[:format] == "json"
      results = @user.send(params[:type]).map{|data| data.toMap}
    elsif "stars" == params[:type]
      results = @user.stars.map{|data| {id: data.id, user_id: data.user.id, note_id: data.note_id}}
    end

    @json = JSON.generate results 

    respond_to do |format|
      format.html { render json: @json}
      format.json { render json: @json}
    end
  end

  def showMembers
    @user = User.find(params[:id])
    gon.user_id = current_user.id
    gon.show_user_id = @user.id
    gon.type = "members"
    render "organizations"
  end
  
  def showMemberRequests
    @user = User.find(params[:id])
    gon.user_id = current_user.id
    gon.show_user_id = @user.id
    gon.type = "member_requests"
    render "member_requests"
  end
  
  def showSubscribers
    @user = User.find(params[:id])
    gon.user_id = current_user.id
    gon.show_user_id = @user.id
    gon.type = "subscribers"
    render "organizations"
  end
end
