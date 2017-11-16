Rails.application.routes.draw do
  resources :subscribers, only: [:create, :destroy]

  resources :scopes, only: [:create, :destroy]

  resources :members, only: [:create, :destroy]

  resources :member_requests, only: [:create, :destroy]

  resources :notes, except: [:index] do
    member do
      get "file", to: "notes#file"
      get "info/:type", to: "notes#info"
    end
  end

  resources :user_infos, path: "users", except: [:create, :new, :destroy] do
    member do
      get "info/:type", to: "user_infos#info"
      get "members", to: "user_infos#showMembers"
      get "member_requests", to: "user_infos#showMemberRequests"
      get "subscribers", to: "user_infos#showSubscribers"
    end
  end

  resources :organizations, path: "org", except: [:destroy, :index], param: :name do
    member do
      get "info/:type", to: "organizations#info"
      get "members", to: "organizations#showMembers"
      get "member_requests", to: "organizations#showMemberRequests"
      get "subscribers", to: "organizations#showSubscribers"
    end
  end

  resources :search, only: [:index] do
    collection do
      get "organizations(.:format)(/:text)", to: "search#organizations"
      get "users(.:format)(/:text)", to: "search#users"
      get "notes(.:format)(/:text)", to: "search#notes"
    end
  end

  resources :stars, only: [:create, :destroy]

  root "home#index"

  devise_for :users, path: "auth"
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html 
end
