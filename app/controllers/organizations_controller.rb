class OrganizationsController < ApplicationController
  def index
    @organizations = Organization.all
  end

  def show
    @organization = Organization.find_by(name: params[:name])
    @json = JSON.generate({id: @organization.id,
                           name: @organization.name,
                           image: @organization.image.url,
                           icon: @organization.icon.url,
                           description: @organization.description
                          })
    if current_user && [nil, "html"].include?(params[:format])
      gon.user_id = current_user.id
      gon.organization_id = @organization.id
    end
    respond_to do |format|
      format.html
      format.json {render json: @json}
    end
  end
  
  def new
    @organization = Organization.new
  end
  
  def create
    if Organization.exists?(name: params[:name])
      render 'Organization_already_exists', status: :internal_server_error
    end
    organization_params = params.require(:organization).permit(:name, :description, :icon, :image)
    @organization = Organization.create(organization_params)
    Member.create(user_id: current_user.id, organization_id: @organization.id)
    redirect_to @organization 
  end

  def edit
    @organization = Organization.find_by(name: params[:name])
  end

  def update
    @organization = Organization.find_by(name: params[:name])
    organization_params = params.require(:organization).permit(:name, :description, :icon, :image)
    @organization.update(organization_params)
    redirect_to @organization
  end

  def search
    @org = Organization.find_by(name: params[:name])
    @json = "[]"
    if params[:type] == "notes"
      notes = @org.notes.map {|data| {id: data.id, title: data.title, description: data.description, user_id: data.user_id}}
      @json = JSON.generate(notes)
    elsif ["subscriber_users", "member_users", "member_request_users"].include? params[:type]
      data = @org.send(params[:type]).map do |data|
        info = data.user_info
        {id: data.id, name: info.name, description: info.description, icon: info.icon.url}
      end
      @json = JSON.generate(data)
    end

    respond_to do |format|
      format.html { render json: @json}
      format.json { render json: @json}
    end
  end
end
