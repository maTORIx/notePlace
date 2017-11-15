class StarsController < ApplicationController
  def create
    star_params = params.require(:star).permit(:note_id, :user_id)
    if(current_user.id == star_params["user_id"])
      @star = Star.create(star_params)
      render json: JSON.generate(@star), status: 200
    end
  end
  
  def destroy
    @star = Star.find(params[:id])
    if(current_user.id == @star.user_id)
      @star.delete
      render plain: "OK", status: 200
    else
      render plain: "forbidden", status: 403
    end
  end
end
