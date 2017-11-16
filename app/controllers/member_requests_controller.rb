class MemberRequestsController < ApplicationController
  def create
    member_request_params = params.require(:member_request).permit(:organization_id, :user_email)
    org = Organization.find_by(id: member_request_params[:organization_id])
    user = User.find_by(email: member_request_params[:user_email])
    if org != nil && org.member_users.include?(current_user) && !(org.member_users.include?(user))
      @member_request = MemberRequest.new({organization_id: org.id, user_id: user.id})
      @member_request.save
      render json: user.user_info.toJSON
    end
  end

  def destroy
    @member_request = MemberRequest.find(params[:id])
    org = Organization.find_by(id: @member_request.organization_id)
    if (org != nil && org.member_users.include?(current_user)) || @member_request.user_id == current_user.id
      @member_request.destroy
    end

  end
end
