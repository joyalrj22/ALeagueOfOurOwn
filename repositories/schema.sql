-- TiDB Cloud / MySQL Initial Schema for A League Of Our Own

-- Leagues table: Stores main metadata and scoring structure
CREATE TABLE leagues (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  invite_code VARCHAR(10) UNIQUE NOT NULL,
  admin_id VARCHAR(255) NOT NULL,
  scoring_config TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Members table: Tracks which users belong to which leagues
CREATE TABLE members (
  user_id VARCHAR(255) NOT NULL,
  league_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  name VARCHAR(255),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, league_id),
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Entries table: Records game results/ranks for standings
CREATE TABLE entries (
  id VARCHAR(255) PRIMARY KEY,
  league_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  result VARCHAR(50), -- 'win', 'loss', 'draw' for match-based
  opponent_id VARCHAR(255),
  rank_val INT, -- points awarded based on place
  timestamp VARCHAR(100) NOT NULL,
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id, league_id) REFERENCES members(user_id, league_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
