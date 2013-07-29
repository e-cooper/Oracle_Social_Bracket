Brakkit::Application.routes.draw do


  resources :tournaments do
    member do
      post 'winner'
    end
    collection do
      post 'add_new_tournament'
      post 'search_tournaments'
    end

    resources :players do
      collection do
        post 'multiremove'
        post 'add_new_player'
      end
    end

  end

  resources :players do
    collection do
      post 'multiadd'
      post 'add_new_player'
      post 'search_players'
    end
  end

  resources :matches do
    collection do
      post 'add_new_match'
      post 'search_matches'

    end
    member do
      post 'verdict'
      post 'add_match_player'
      post 'remove_match_player'
      get 'non_match_players'
      post 'add_player_from_player_picker'
    end

    resources :players do

    end
  end

  root to: 'tournaments#index'

  get '/home',    to: 'tournaments#index'
  get '/contact', to: 'static_pages#contact'
  get '/players', to: 'players#index'
  get '/players/:id', to: 'players#show'
  get '/tournaments/:id', to: 'tournaments#show'
  get '/tournaments/:id/player', to: 'players#show'
  get '/tournaments/:id/players/:id', to: 'players#show'
  post '/players/:id/edit', to: 'players#edit'
  post '/tournaments/:id/players/:id/edit', to: 'players#edit'
  get '/tournaments/:id/start', to: 'tournaments#start_tournament', as: 'start_tournament'
  get '/tournaments/:id/add_index/', to: 'players#add_index', as: 'add_index'
  get '/matches/:id/start_match', to: 'matches#start_match', as: 'start_match'

  #ajax routes

  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'
end
