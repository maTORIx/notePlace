class SearchController < ApplicationController
  def searchOrganizations
    @orgs = Organization.search(params[:text]).results.results
    data = @orgs.map do |org|
      {id: org.id, name: org.name, description: org.description, icon: org.icon.url, image: org.image.url}
    end
    render json: JSON.generate(data)
  end
  
  def searchUsers
    @users = UserInfo.search(params[:text]).results.results
    data = @users.map do |user|
      {id: user.id, name: user.name, description: user.description, icon: user.icon.url}
    end
    render :json => JSON.generate(data)
  end
  
  def searchNotes
    @notes = Note.search(params[:text]).results.results
    data = @notes.map do |note|
      {id: note.id, title: note.title, description: note.description, user_id: note.user_id}
    end
    render json: JSON.generate(data)
  end
  
end
