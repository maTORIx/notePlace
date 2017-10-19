class MemberRequestsController < ApplicationController
  def index
    @member_requests = MemberRequest.all
  end

  def show
    @member_request = MemberRequest.find(params[:id])
  end

  def create
    member_request_params = params.require(:member_request).permit(:organization_id)
    org = Organization.find_by(id: member_request_params[:organization_id])
    if org != nil && org.member_users.include? current_user
      @member_request = current_user.member_requests.create(subs_params)
    end
    redirect_to @member_request
  end

  def destroy
    @member_request = MemberRequest.find(params[:id])
    org = Organization.find_by(id: @member_request.organization_id)
    if (org != nil && org.member_users.include? current_user) || @member_request.user_id == current_user.id
      @member_request.destroy
    end
    redirect_to root
  end
end
