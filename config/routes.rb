Rails.application.routes.draw do
  resources :user_infos, :path => "users", :except => [:create, :new, :destroy]

  get 'home/index'

  devise_for :users
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html 
end
