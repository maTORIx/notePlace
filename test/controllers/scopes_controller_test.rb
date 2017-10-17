require 'test_helper'

class ScopesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get scopes_index_url
    assert_response :success
  end

  test "should get show" do
    get scopes_show_url
    assert_response :success
  end

  test "should get new" do
    get scopes_new_url
    assert_response :success
  end

  test "should get create" do
    get scopes_create_url
    assert_response :success
  end

  test "should get destroy" do
    get scopes_destroy_url
    assert_response :success
  end

end
