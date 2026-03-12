-- Seed data for Good Deeds Network MVP

-- Insert default badges
insert into public.badges (name, description, icon_url, category, requirement_type, requirement_value) values
  ('First Steps', 'Complete your first task', null, 'milestone', 'tasks_completed', 1),
  ('Dedicated Helper', 'Complete 10 tasks', null, 'milestone', 'tasks_completed', 10),
  ('Impact Champion', 'Complete 50 tasks', null, 'milestone', 'tasks_completed', 50),
  ('Legendary Volunteer', 'Complete 100 tasks', null, 'milestone', 'tasks_completed', 100),
  ('River Guardian', 'Complete 5 river cleanup tasks', null, 'environmental', 'category_specific', 5),
  ('Forest Protector', 'Complete 5 forest cleanup tasks', null, 'environmental', 'category_specific', 5),
  ('Park Hero', 'Complete 5 park cleanup tasks', null, 'environmental', 'category_specific', 5),
  ('Community Champion', 'Complete 5 community help tasks', null, 'community', 'category_specific', 5),
  ('Wildlife Friend', 'Complete 5 wildlife support tasks', null, 'environmental', 'category_specific', 5),
  ('Eco Builder', 'Complete 5 environmental building tasks', null, 'environmental', 'category_specific', 5),
  ('Early Adopter', 'Join during the beta period', null, 'milestone', 'special', 1),
  ('Trash Collector', 'Remove 10kg of trash', null, 'environmental', 'trash_collected', 10),
  ('Eco Warrior', 'Remove 100kg of trash', null, 'environmental', 'trash_collected', 100),
  ('Planet Saver', 'Remove 1000kg of trash', null, 'environmental', 'trash_collected', 1000)
on conflict (name) do nothing;

-- Insert sample tasks (globally distributed)
insert into public.tasks (title, description, instructions, category, difficulty, latitude, longitude, location_name, token_reward, impact_points, estimated_trash_kg, estimated_duration_minutes) values
  -- New York Area
  ('Central Park Cleanup', 'Help clean up litter around the Great Lawn area of Central Park.', 'Focus on areas near benches and pathways. Bring your own gloves if possible.', 'park_cleanup', 'easy', 40.7829, -73.9654, 'Central Park, New York', 15, 10, 2.5, 30),
  ('Hudson River Trail', 'Clean the riverbank trail near the Hudson River Greenway.', 'Walk along the trail and collect any visible litter. Pay attention to areas near water.', 'river_cleanup', 'medium', 40.7614, -74.0021, 'Hudson River Greenway, NY', 20, 15, 5.0, 45),
  
  -- Los Angeles Area
  ('Venice Beach Cleanup', 'Help remove trash and debris from Venice Beach.', 'Focus on the sandy areas and near trash cans. Early morning is best.', 'park_cleanup', 'easy', 33.9850, -118.4695, 'Venice Beach, LA', 15, 10, 3.0, 30),
  ('Griffith Park Trail', 'Clean hiking trails in Griffith Park.', 'Bring sturdy shoes and water. Focus on trailside litter.', 'forest_cleanup', 'medium', 34.1341, -118.3215, 'Griffith Park, LA', 25, 20, 4.0, 60),
  
  -- London
  ('Hyde Park Litter Pickup', 'Join the community effort to keep Hyde Park beautiful.', 'Meet near the Serpentine. Equipment provided.', 'park_cleanup', 'easy', 51.5073, -0.1657, 'Hyde Park, London', 15, 10, 2.0, 30),
  ('Thames Path Cleanup', 'Help clean the iconic Thames riverside path.', 'Focus on areas near bridges and popular spots.', 'river_cleanup', 'medium', 51.5074, -0.0878, 'Thames Path, London', 20, 15, 4.5, 45),
  
  -- Tokyo
  ('Ueno Park Cleanup', 'Help maintain the beauty of historic Ueno Park.', 'Focus on picnic areas and near the pond.', 'park_cleanup', 'easy', 35.7146, 139.7732, 'Ueno Park, Tokyo', 15, 10, 2.0, 30),
  ('Sumida River Walk', 'Clean the riverside walking path.', 'Morning cleanup before crowds arrive.', 'river_cleanup', 'medium', 35.7100, 139.8107, 'Sumida River, Tokyo', 20, 15, 3.5, 45),
  
  -- Sydney
  ('Bondi Beach Cleanup', 'Keep Australia''s famous beach pristine.', 'Focus on high-tide line and near rock pools.', 'park_cleanup', 'easy', -33.8915, 151.2767, 'Bondi Beach, Sydney', 15, 10, 3.0, 30),
  ('Royal Botanic Garden', 'Help maintain the gardens and remove litter.', 'Gentle cleanup around garden paths.', 'park_cleanup', 'easy', -33.8642, 151.2166, 'Royal Botanic Garden, Sydney', 12, 8, 1.5, 25),
  
  -- Berlin
  ('Tiergarten Cleanup', 'Help clean Berlin''s largest inner-city park.', 'Focus on pathways and around benches.', 'park_cleanup', 'easy', 52.5145, 13.3501, 'Tiergarten, Berlin', 15, 10, 2.5, 30),
  ('Spree River Path', 'Clean the banks of the River Spree.', 'Be careful near the water. Focus on accessible areas.', 'river_cleanup', 'medium', 52.5069, 13.4262, 'Spree River, Berlin', 20, 15, 4.0, 45),
  
  -- Community Help Tasks
  ('Community Garden Support', 'Help local community garden with weeding and cleanup.', 'No experience needed. Tools provided.', 'community_help', 'easy', 40.7282, -73.7949, 'Queens Community Garden, NY', 20, 15, 0, 60),
  ('Animal Shelter Assistance', 'Help clean and organize at local animal shelter.', 'Assist with feeding, cleaning, and organizing supplies.', 'community_help', 'easy', 34.0522, -118.2437, 'LA Animal Shelter', 25, 20, 0, 90),
  
  -- Wildlife Support
  ('Bird Feeder Installation', 'Build and install bird feeders in local park.', 'Materials provided. Basic assembly required.', 'wildlife_support', 'medium', 51.4826, -0.0077, 'Greenwich Park, London', 30, 25, 0, 120),
  ('Bee Hotel Building', 'Create habitats for native bees.', 'Workshop style - learn while you help!', 'environmental_building', 'medium', 48.8566, 2.3522, 'Jardin des Plantes, Paris', 35, 30, 0, 90)
on conflict do nothing;

-- Insert a sample challenge
insert into public.challenges (title, description, target_kg, target_tasks, bonus_tokens, ends_at, is_active) values
  ('Spring Cleanup 2026', 'Join the global effort to clean up our parks and rivers this spring! Every contribution counts toward our collective goal.', 10000, 500, 100, '2026-06-01 00:00:00+00', true),
  ('World Ocean Day Challenge', 'Celebrate World Ocean Day by cleaning up beaches and waterways around the world.', 5000, 250, 75, '2026-06-08 00:00:00+00', true)
on conflict do nothing;
