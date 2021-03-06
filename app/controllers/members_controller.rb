class MembersController < ApplicationController
  def create
    member_params = params.require(:member).permit(:request_id)
    member_request = MemberRequest.find(member_params[:request_id])
    if member_request != nil && member_request.user_id == current_user.id
      @member = Member.new(user_id: member_request.user_id, organization_id: member_request.organization_id)
      @member.save!
      member_request.destroy
      render json: JSON.generate(current_user.toMap)
    else
      render plain: "403", status: 403
    end
  end

  def destroy
    @member = Member.find(params[:id])
    org = Organization.find_by(id: @member.organization_id)
    if org != nil && org.member_users.include?(current_user)
      @member.destroy
    end
  end
end
