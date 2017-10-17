require 'test_helper'

class NoteFilesControllerTest < ActionDispatch::IntegrationTest
  test "should get show" do
    get note_files_show_url
    assert_response :success
  end

end
