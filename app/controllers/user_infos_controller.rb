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
    @user_info.lock!
    user_info_params = params.require(:user_info).permit(:hometown, :description, :name, :icon)
    @user_info.update!(user_info_params)
    redirect_to @user_info
  end

  def info
    @user = User.find(params[:id])
    @json = "[]"
    if params[:type] == "notes"
      notes = @user.notes.map {|data| {id: data.id, title: data.title, description: data.description, user_id: data.user_id}}
      @json = JSON.generate(notes)
    
    elsif params[:type] == "timeline"
      orgs = @user.subscriber_organizations
      result = []
      orgs.each do |org|
        org.notes.each do |data|
          result.push({id: data.id, title: data.title, description: data.description, user_id: data.user_id})
        end
      end

      @json = JSON.generate(result.uniq)
    elsif ["subscriber_organizations", "member_organizations", "member_request_organizations"].include? params[:type]
      data = @user.send(params[:type]).map {|data| {id: data.id, name: data.name, description: data.description, icon: data.icon.url, image: data.image.url}}
      @json = JSON.generate(data)
    elsif ["members", "subscribers", "member_requests"].include?(params[:type]) && params[:format] == "json"
      data = @user.send(params[:type]).map{|data| {id: data.id, user_id: data.user_id, organization_id: data.organization_id}}
      @json = JSON.generate(data)
    end

    respond_to do |format|
      format.html { render json: @json}
      format.json { render json: @json}
    end
  end

  def showMembers
    @user = User.find(params[:id])
    gon.user_id = current_user.id
    gon.show_user_id = @user.id
    gon.type = "member"
    render "organizations"
  end
  
  def showMemberRequests
    @user = User.find(params[:id])
    gon.user_id = current_user.id
    gon.show_user_id = @user.id
    gon.type = "member_request"
    render "member_requests"
  end
  
  def showSubscribers
    @user = User.find(params[:id])
    gon.user_id = current_user.id
    gon.show_user_id = @user.id
    gon.type = "subscriber"
    render "organizations"
  end
end
