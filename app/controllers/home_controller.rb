class HomeController < ApplicationController
  def index
    @current_user = current_user
    gon.user_id = current_user.id
  end
end
