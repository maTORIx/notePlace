class OrganizationsController < ApplicationController
  def index
    @organizations = Organization.all
  end

  def show
    @organization = Organization.find_by(name: params[:name])
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
  
end
