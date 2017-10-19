class SubscribersController < ApplicationController
  def index
    @subscribers = Subscriber.all
  end

  def show
    @subscriber = Subscriber.find(params[:id])
  end

  def create
    subs_params = params.require(:subscriber).permit(:organization_id)
    @subscriber = current_user.subscribers.create(subs_params)
    redirect_to @subscriber
  end

  def destroy
    @subscriber = Subscriber.find(params[:id])
    if @subscriber.user_id == current_user.id
      @subscriber.destroy
    end
    redirect_to root
  end
end
