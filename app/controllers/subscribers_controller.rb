class SubscribersController < ApplicationController
  def index
    @subscribers = Subscriber.all
  end

  def show
    @subscriber = Subscriber.find(params[:id])
  end

  def create
    subs_params = params[:subscriber].permit(:org_id)
    @subscriber = current_user.subscribers.create(subs_params)
    redirect_to @subscriber
  end

  def destroy
    @subscriber = Subscriber.find(params[:id])
    @subscriber.destroy
    redirect_to root
  end
end
