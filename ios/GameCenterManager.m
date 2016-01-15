//
//  GameCenterManager.m
//  Fortress
//
//  Created by Matthew Steedman on 12/11/15.
//  Copyright © 2015 Facebook. All rights reserved.
//

#import "GameCenterManager.h"
#import "AppDelegate.h"
#import "RCTBridge.h"
#import "RCTEventDispatcher.h"
@import GameKit;

@implementation GameCenterManager

@synthesize bridge = _bridge;

//int RCTLogInfo(NSString *message);

RCT_EXPORT_MODULE();

//RCT_EXPORT_METHOD(newMatch:(NSString *)name location:(NSString *)location)

RCT_EXPORT_METHOD(newMatch)
{
  //TODO: Handle non-logged in players.
  //NSLog(@"Pretending to create an event %@ at %@", name, location);
  NSLog(@"Loading GK Matchmaker view");
  UIViewController *rootController = (UIViewController*)[[(AppDelegate*)
                                    [[UIApplication sharedApplication]delegate] window] rootViewController];
  
  GKMatchRequest *request = [[GKMatchRequest alloc] init];
  request.minPlayers = 2;
  request.maxPlayers = 2;
  
  GKTurnBasedMatchmakerViewController *mmvc = [[GKTurnBasedMatchmakerViewController alloc] initWithMatchRequest:request];
  mmvc.turnBasedMatchmakerDelegate = self;
//  mmvc.showExistingMatches = NO;
  
  [rootController presentViewController:mmvc animated:YES completion:nil];
}

RCT_EXPORT_METHOD(clearMatch)
{
  self.currentMatch = nil;
}

RCT_EXPORT_METHOD(endMatchInTurnWithMatchData:(NSString *)game)
{
  NSLog(@"End turn with next participants");
  if (self.currentMatch.participants[0].player.playerID == self.currentMatch.currentParticipant.player.playerID)
  {
    self.currentMatch.participants[0].matchOutcome = 2; // Won
    self.currentMatch.participants[1].matchOutcome = 3; // Lost
  } else {
    self.currentMatch.participants[1].matchOutcome = 2; // Won
    self.currentMatch.participants[0].matchOutcome = 3; // Lost
  }
  
  NSData * updatedMatchData = [game dataUsingEncoding:NSUTF8StringEncoding]; //Data
  [self.currentMatch endMatchInTurnWithMatchData:updatedMatchData completionHandler:^(NSError *error) {
    if (error)
    {
      // Handle the error.
    }
  }];
}

RCT_EXPORT_METHOD(endTurnWithNextParticipants:(NSString *)game)
{
  NSLog(@"End turn with next participants");
  
  NSLog(@"participants[0] ID: %@", self.currentMatch.participants[0].playerID);
  NSLog(@"participants[1] ID: %@", self.currentMatch.participants[1].playerID);
  NSLog(@"currentParticipant ID: %@", self.currentMatch.currentParticipant.playerID);
  
  NSArray* nextPlayer;
  
  if (self.currentMatch.currentParticipant.playerID == self.currentMatch.participants[0].playerID)
  {
    nextPlayer = @[self.currentMatch.participants[1]];
  } else {
    nextPlayer = @[self.currentMatch.participants[0]];
  }
  
  // Game Over:
  //   - Rematch
  //   - Close
//  self.currentMatch.message = @"It's your turn!";
  
  NSData * updatedMatchData = [game dataUsingEncoding:NSUTF8StringEncoding]; //Data
  //NSArray* sortedPlayerOrder = [[self.currentMatch.participants reverseObjectEnumerator] allObjects];
  [self.currentMatch endTurnWithNextParticipants:nextPlayer turnTimeout:GKTurnTimeoutDefault matchData:updatedMatchData completionHandler: ^(NSError *error) {
    if (error)
    {
      NSLog(@"end turn error");
      // Handle the error.
      NSLog(@"%@", error);
    }
  }];
}

#pragma mark init

- (id)init {
  NSLog(@"authenticating player...");
  self = [super init];

  [GKLocalPlayer localPlayer].authenticateHandler = ^(UIViewController *viewController, NSError *error){
    if (viewController != nil)
    {
      //showAuthenticationDialogWhenReasonable: is an example method name. Create your own method that displays an authentication view when appropriate for your app.
      //[self showAuthenticationDialogWhenReasonable: viewController];
      NSLog(@"Show auth dialog");
    }
    else if ([GKLocalPlayer localPlayer].authenticated)
    {
      //authenticatedPlayer: is an example method name. Create your own method that is called after the local player is authenticated.
      //[self authenticatedPlayer: localPlayer];
      NSLog(@"Player is authenticated");
      [[GKLocalPlayer localPlayer] unregisterAllListeners];
      [[GKLocalPlayer localPlayer] registerListener:self];
    }
    else
    {
      NSLog(@"Player is not authenticated");
      //[self disableGameCenter];
    }
  };
  return self;
  // Forward to the "designated" initialization method
//  return [self initWithModel:_defaultModel];
}

#pragma mark GKTurnBasedEventListener

- (void)player:(GKPlayer *)player receivedTurnEventForMatch:(GKTurnBasedMatch *)match didBecomeActive:(BOOL)didBecomeActive
{
  NSLog(@"received turn event for match");
  [match loadMatchDataWithCompletionHandler:^(NSData *rawMatchData, NSError *error) {
    if (error)
    {
      NSLog(@"loadMatchData error");
      NSLog(@"%@", error);
      // Handle the error.
    } else {
      NSString* matchData;
      if (rawMatchData.length == 0)
      {
        matchData = @"";
      } else {
        matchData = [[NSString alloc] initWithData:rawMatchData
                                      encoding:NSUTF8StringEncoding];
      }
      GKLocalPlayer *localPlayer = [GKLocalPlayer localPlayer];
      NSDictionary *event = @{
                              @"match": @{
                                  //      @"creationDate": [NSNumber numberWithDouble:[match.creationDate timeIntervalSinceReferenceDate]],
                                  @"matchID": match.matchID,
                                  @"yourTurn": match.currentParticipant.player == localPlayer ? @(YES) : @(NO),
                                  @"newMatch": rawMatchData.length == 0 ? @(YES) : @(NO),
                                  @"matchData": matchData,
                                  //      @"message": match.message,
                                  //      @"currentParticipant": match.currentParticipant.player.playerID,
                                  }
                              };
      if (didBecomeActive) {
        NSLog(@"did become active");
        // Launch the playView from didfindmatch
        self.currentMatch = match;
        [_bridge.eventDispatcher sendAppEventWithName:@"didFindMatch" body:event];
        [_bridge.eventDispatcher sendAppEventWithName:@"updateMatchData" body:event];
      } else {
        NSLog(@"did NOT become active");
        if (self.currentMatch) {
          NSLog(@"match is currentMatch");
          self.currentMatch = match;
          // Update matchdata?
          NSDictionary *event = @{
                                  @"match": @{
                                      @"matchData": matchData,
                                      }
                                  };
          [_bridge.eventDispatcher sendAppEventWithName:@"updateMatchData" body:event];
        } else {
          // do nothing?
        }
      }
    }
  }];
  
  // didBecomeActive
  //   - Launch from GKViewController (didFindMatch)
  //   - Launch from Push Notification
  // didNOTBecomeActive
  //   - Viewing another match
  //     - Do Nothing
  //   - Viewing the current match
  //     - Send turn alert, update match
  //   - Viewing the home screen
  //     - Make this match first in the list

  // if didBecomeActive
  //   launch the playView, regardless of where they are.
  // else
  //   if match == self.currentMatch
  //     send notification, update matchdata in React
  //   else
  //     do Nothing?

}

- (void)player:(GKPlayer *)player didRequestMatchWithOtherPlayers:(NSArray<GKPlayer *> *)playersToInvite
{
  NSLog(@"Did receive match request with other players");
}

#pragma mark GKTurnBasedMatchmakerViewControllerDelegate

- (void)turnBasedMatchmakerViewController:(GKTurnBasedMatchmakerViewController *)viewController didFindMatch:(GKTurnBasedMatch *)match
{
  NSLog(@"didFindMatch");
  
  UIViewController *rootController = (UIViewController*)[[(AppDelegate*)
                                                          [[UIApplication sharedApplication]delegate] window] rootViewController];
  
  NSString* matchData;
  if (match.matchData.length == 0)
  {
    matchData = @"";
  } else {
    matchData = [[NSString alloc] initWithData:match.matchData
                                      encoding:NSUTF8StringEncoding];
  }
  GKLocalPlayer *localPlayer = [GKLocalPlayer localPlayer];
  NSDictionary *event = @{
                          @"match": @{
                              //      @"creationDate": [NSNumber numberWithDouble:[match.creationDate timeIntervalSinceReferenceDate]],
                              @"matchID": match.matchID,
                              @"yourTurn": match.currentParticipant.player == localPlayer ? @(YES) : @(NO),
                              @"newMatch": match.matchData.length == 0 ? @(YES) : @(NO),
                              @"matchData": matchData,
                              //      @"message": match.message,
                              //      @"currentParticipant": match.currentParticipant.player.playerID,
                              }
                          };
  
  self.currentMatch = match;
//  [_bridge.eventDispatcher sendAppEventWithName:@"didFindMatch" body:event];

  [rootController dismissViewControllerAnimated:YES completion:nil];
  
//  [match removeWithCompletionHandler:^(NSError *error) {
//    
//  }];
}

- (void)turnBasedMatchmakerViewController:(GKTurnBasedMatchmakerViewController *)viewController playerQuitForMatch:(GKTurnBasedMatch *)match
{
  NSLog(@"PlayerQuitForMatch");
  
  UIViewController *rootController = (UIViewController*)[[(AppDelegate*)
                                                          [[UIApplication sharedApplication]delegate] window] rootViewController];
  [rootController dismissViewControllerAnimated:YES completion:nil];
}

- (void)turnBasedMatchmakerViewController:(GKTurnBasedMatchmakerViewController *)viewController didFailWithError:(nonnull NSError *)error
{
  NSLog(@"didFailWithError");
  NSLog(@"%@", error);
  
  UIViewController *rootController = (UIViewController*)[[(AppDelegate*)
                                                          [[UIApplication sharedApplication]delegate] window] rootViewController];
  [rootController dismissViewControllerAnimated:YES completion:nil];
}

- (void)turnBasedMatchmakerViewControllerWasCancelled:(GKTurnBasedMatchmakerViewController *)viewController {
  NSLog(@"WasCancelled");
  UIViewController *rootController = (UIViewController*)[[(AppDelegate*)
                                                          [[UIApplication sharedApplication]delegate] window] rootViewController];
  [rootController dismissViewControllerAnimated:YES completion:nil];
}


@end
