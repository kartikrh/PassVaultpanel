export function mapCommentaryStatus(status) {
    switch (parseInt(status)) {
      case 1:
        return "Open";
      case 2:
        return "Toss";
      case 3:
        return "Batsman Man select";
      case 4:
        return "Bowler select";
      case 5:
        return "Start Scoring";
      case 6:
        return "Innings End";
      case 7:
        return "Third Bet Running";
      case 8:
        return "Third Bet Completed";
      case 9:
        return "Fourth Bet Running";
      case 10:
        return "Fourth Bet Completed";
      case 11:
        return "Match Completed";
      default:
        return "-";
    }
  }