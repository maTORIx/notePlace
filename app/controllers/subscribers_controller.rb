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

  def search
    @subscribers_json = {}.to_json
    if params[:from] == "user"
      subscribers = Subscriber.find_by(user_id: params[:search_id])
      @subscribers_json = subscribers.map {|data| data.as_json}
    elsif params[:from] == "org"
      subscribers = Subscriber.find_by(organization_id: params[:search_id])
      @subscribers_json = subscribers.map {|data| data.as_json}
    end
    
    respond_to do |format|
      format.json {render json: @subscribers_json}
    end
  end
end
