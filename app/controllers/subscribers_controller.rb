class SubscribersController < ApplicationController
  def create
    subs_params = params.require(:subscriber).permit(:organization_id)
    @subscriber = current_user.subscribers.create(subs_params)
    render json: current_user.user_info.toJSON
  end

  def destroy
    @subscriber = Subscriber.find(params[:id])
    if @subscriber.user_id == current_user.id
      @subscriber.destroy
    end
  end
end
