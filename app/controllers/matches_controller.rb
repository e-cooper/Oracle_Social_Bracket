class MatchesController < ApplicationController

  def index
    @matches = Match.where(tournament_id: 0).order("created_at DESC").paginate(page: params[:page], per_page: 15)
    @match = Match.new
  end

  def new
    @match = Match.new
  end

  def show
    @match = Match.find(params[:id])
  end

  def start_match
    @match = Match.find(params[:id])
  end

  def verdict
    @match = Match.find(params['match-id'])
    @player = Player.find(params['player-id'])

    if(@match.player1_id == @player.id)
      @loser = @match.player2
    else
      @loser = @match.player1
    end

    @match.winner = @player
    @player.increment_wins

    @match.save

    respond_to do |format|
      format.json {
         render json: {
             player: @player,
             match: @match,
             winner_name: @player.full_name,
             loser_name: @loser.full_name
         }
      }
    end
  end

  #def create
  #  @match = Match.create(params[:name])
  #end

  def add_new_match
    @match = Match.new(name: params['name'])

    respond_to do |format|
      format.json {
        if @match.save
          render json: @match
        else
          render json: @match.errors, status: :forbidden
        end
      }
    end
  end

  def search_matches
    search = params['search_term']

    if !search.empty?
      search_result = Match.where("name LIKE :test", test: "%#{search}%")
    else
      search_result = Match.order("created_at DESC").paginate(page: params[:page], per_page: 16)
    end

    respond_to do |format|
      format.json {
        render json: {
            search_result: search_result
        }
      }
    end
  end
end
